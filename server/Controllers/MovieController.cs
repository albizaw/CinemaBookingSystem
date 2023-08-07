using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using server.Context;
using server.Models;
using Microsoft.DotNet.Scaffolding.Shared.Messaging;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace server.Controllers
{
    [Route("/")]
    public class MovieController : Controller
    {
        private readonly AppDbContext _authContext;
        private readonly IConfiguration _configuration;

        public MovieController(AppDbContext appDbContext, IConfiguration configuration)
        {
            _authContext = appDbContext;
            _configuration = configuration;
        }

        [HttpGet("movies")]
        public async Task<ActionResult<Movie>> GetAllMovies()
        {
            return Ok(await _authContext.Movies.ToListAsync());
        }

        [HttpPost("movies/add")]
        public async Task<IActionResult> AddMovie([FromBody] Movie movie)
        {
            if (movie == null)
                return BadRequest();

            if (await CheckTitleExisting(movie.Title))
            {
                return BadRequest(new { Message = "Title already exist!" });
            }

            await _authContext.Movies.AddAsync(movie);
            await _authContext.SaveChangesAsync();

            return Ok(new { Message = "Movie added" });
        }

        [HttpGet("movies/{id}")]
        public async Task<ActionResult<Movie>> GetMovieById(int id)
        {
            var movie = await _authContext.Movies.FindAsync(id);

            if (movie == null)
            {
                return NotFound(new { Message = "Movie not found" });
            }

            return Ok(movie);
        }

        [HttpGet("movieSeances/{id}")]
        public async Task<ActionResult<Movie>> GetMovie(int id)
        {
            Movie movie = await _authContext.Movies
                .Include(m => m.Seances)
                .FirstOrDefaultAsync(m => m.Id == id);

            if (movie == null)
            {
                return NotFound();
            }

            JsonSerializerOptions options = new JsonSerializerOptions
            {
                ReferenceHandler = ReferenceHandler.Preserve
            };

            string jsonMovie = JsonSerializer.Serialize(movie, options);

            return Ok(jsonMovie);
        }

        [HttpDelete("movies/delete/{id}")]
        public async Task<IActionResult> DeleteMovie(int id)
        {
            var movie = await _authContext.Movies.FindAsync(id);
            if (movie == null)
            {
                return NotFound(new { Message = "Movie not found" });
            }

            _authContext.Movies.Remove(movie);
            await _authContext.SaveChangesAsync();

            return Ok(new { Message = "Movie deleted successfully" });
        }

        [HttpPut("movies/{id}")]
        public async Task<IActionResult> UpdateMovie(int id, [FromBody] Movie updatedMovie)
        {
            var movie = await _authContext.Movies.FindAsync(id);

            if (movie == null)
            {
                return NotFound(new { Message = "Movie not found" });
            }

            movie.Title = updatedMovie.Title;
            movie.Description = updatedMovie.Description;
            movie.Duration = updatedMovie.Duration;

            _authContext.Entry(movie).State = EntityState.Modified;
            await _authContext.SaveChangesAsync();

            return Ok(new { Message = "Movie updated successfully" });
        }

        private Task<bool> CheckTitleExisting(string title) =>
            _authContext.Movies.AnyAsync(x => x.Title == title);
    }
}
