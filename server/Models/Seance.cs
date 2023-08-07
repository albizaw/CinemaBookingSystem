using System.ComponentModel.DataAnnotations;

namespace server.Models
{
    public class Seance
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public DateTime DateStart { get; set; }

        public DateTime DateEnd { get; set; }

        public TimeSpan? StartTime { get; set; }

        public TimeSpan? EndTime { get; set; }

        public int MovieId { get; set; }
        public Movie? Movie { get; set; }

        public List<Seat> Seats { get; set; } = new List<Seat>();

        public List<Order> Orders { get; set; } = new List<Order>();
    }
}