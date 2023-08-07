using System.ComponentModel.DataAnnotations;

namespace server.Models
{
    public class Movie
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Title { get; set; }
        public string Description { get; set; }

        [Required]
        public string Duration { get; set; }
        [Required]
        public string Poster { get; set; }

        public List<Seance> Seances { get; set; } = new List<Seance>();

    }
}