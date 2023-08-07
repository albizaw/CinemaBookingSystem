using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.DotNet.Scaffolding.Shared.Messaging;
using Microsoft.EntityFrameworkCore;
using server.Context;
using server.Models;

namespace server.Controllers
{
    [Route("/")]
    public class SeanceController : Controller
    {
        private readonly AppDbContext _context;

        public SeanceController(AppDbContext appDbContext)
        {
            _context = appDbContext;
        }

        [HttpGet("seances")]
        public async Task<ActionResult<IEnumerable<SeanceWithMovieTitle>>> GetAllSeances()
        {
            var currentDate = DateTime.UtcNow;

            var seancesToDelete = await _context.Seances
                .Where(s => s.DateStart < currentDate)
                .ToListAsync();

            _context.Seances.RemoveRange(seancesToDelete);
            await _context.SaveChangesAsync();

            var seancesWithTitles = await _context.Seances
                .Include(s => s.Movie) //
                .Select(
                    s =>
                        new SeanceWithMovieTitle
                        {
                            Id = s.Id,
                            DateStart = s.DateStart,
                            DateEnd = s.DateEnd,
                            MovieId = s.MovieId,
                            MovieTitle = s.Movie.Title,
                            Poster = s.Movie.Poster
                        }
                )
                .ToListAsync();

            return Ok(seancesWithTitles);
        }

        [HttpGet("seance/{id}")]
        public async Task<ActionResult<Movie>> GetMovieById(int id)
        {
            var seance = await _context.Seances
                .Include(s => s.Seats)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (seance == null)
            {
                return NotFound(new { Message = "Seance not found" });
            }

            return Ok(seance);
        }

        [HttpGet("uniquemovies")]
        public async Task<ActionResult<Seance>> getUniqueMovies()
        {
            List<Movie> uniqueMovies = await _context.Movies
                .Include(m => m.Seances)
                .ThenInclude(s => s.Seats)
                .Where(m => m.Seances.Any())
                .ToListAsync();

            return Ok(uniqueMovies);
        }

        [HttpGet("seanceswithseats")]
        public async Task<ActionResult<Seance>> getSeatsFromSeances()
        {
            List<Seance> seances = await _context.Seances.Include(s => s.Seats).ToListAsync();

            return Ok(seances);
        }

        [HttpPost("seance/add")]
        public async Task<IActionResult> AddSeance([FromBody] Seance request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            Movie movie = await _context.Movies.FindAsync(request.MovieId);

            if (movie != null)
            {
                int duration = Int32.Parse(movie.Duration);
                DateTime dateEnd = request.DateStart.AddMinutes(duration + 15);
                DateTime dateStartUtc = request.DateStart.ToUniversalTime();
                DateTime dateEndUtc = dateEnd.ToUniversalTime();

                if (dateStartUtc <= DateTime.UtcNow)
                {
                    return BadRequest(
                        new { Message = "The seance must have a date in the future." }
                    );
                }

                bool isOverlapping = _context.Seances.Any(
                    s =>
                        s.MovieId == request.MovieId
                        && (
                            (s.DateStart <= dateStartUtc && s.DateEnd >= dateStartUtc)
                            || (s.DateStart <= dateEndUtc && s.DateEnd >= dateEndUtc)
                            || (s.DateStart >= dateStartUtc && s.DateEnd <= dateEndUtc)
                        )
                );

                if (isOverlapping)
                {
                    return BadRequest(new { Message = "There is an overlapping Seance." });
                }

                Seance newSeance = new Seance
                {
                    DateStart = dateStartUtc,
                    DateEnd = dateEndUtc,
                    MovieId = request.MovieId,
                    Movie = movie
                };

                newSeance.Seats = new List<Seat>(25);
                for (int i = 0; i < 25; i++)
                {
                    newSeance.Seats.Add(new Seat { IsFree = true, SeatNumber = i + 1 });
                }

                movie.Seances.Add(newSeance);

                _context.Seances.Add(newSeance);
                _context.SaveChanges();

                return Ok(new { Message = "Seance added successfully." });
            }
            else
            {
                return NotFound(new { Message = "Movie with the specified MovieId not found." });
            }
        }

        public class SeanceWithMovieTitle
        {
            public int Id { get; set; }
            public DateTime DateStart { get; set; }
            public DateTime DateEnd { get; set; }
            public int MovieId { get; set; }
            public string MovieTitle { get; set; }
            public string Poster { get; set; }
        }
    }
}



