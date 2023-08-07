using Microsoft.EntityFrameworkCore;
using server.Models;

namespace server.Context
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {

        }

        public DbSet<User> Users { get; set; }
        public DbSet<Movie> Movies { get; set; }

        public DbSet<Seance> Seances { get; set; }

        public DbSet<Seat> Seats { get; set; }

        public DbSet<Order> Orders { get; set; }


    }
}