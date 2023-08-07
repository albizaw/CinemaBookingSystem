using System.ComponentModel.DataAnnotations;

namespace server.Models
{
    public class Seat
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int SeatNumber { get; set; }

        [Required]
        public bool IsFree { get; set; }
        public Seance Seance { get; set; }

        public int? OrderId { get; set; }

        public Order Order { get; set; }
    }
}