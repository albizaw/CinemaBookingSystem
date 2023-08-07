using System.ComponentModel.DataAnnotations;


namespace server.Models
{
    public class Order
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public Seance OrderedSeance { get; set; }

        [Required]
        public List<Seat> Seats { get; set; }


        public User OrderedUser { get; set; }
    }
}