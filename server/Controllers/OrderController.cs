using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using Microsoft.Extensions.Configuration;
using server.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.DotNet.Scaffolding.Shared.Messaging;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking.Internal;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using NuGet.Common;
using server.Context;

using server.Models;

namespace server.Controllers
{
    [Route("/")]
    public class OrderController : Controller
    {
        private readonly AppDbContext _context;
        private readonly IEmailService _emailService;

        public OrderController(AppDbContext appDbContext, IEmailService emailService)
        {
            _context = appDbContext;
            _emailService = emailService;
        }

        [HttpGet("myorders")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Order>>> GetMyReservations()
        {
            var userId = Convert.ToInt32(User.FindFirstValue("UserId"));
            var currentDate = DateTime.UtcNow;

            var myReservations = await _context.Orders
                .Where(o => o.OrderedUser.Id == userId)
                .Include(o => o.OrderedSeance)
                .Include(o => o.Seats)
                .Include(o => o.OrderedUser)
                .Where(o => o.OrderedSeance.DateStart >= currentDate)
                .ToListAsync();

            return Ok(myReservations);
        }

        [HttpPost("order/add")]
        [Authorize]
        public async Task<IActionResult> NewOrder([FromBody] OrderRequest order)
        {
            if (order.SelectedPlaces == null)
            {
                return BadRequest(new { Message = "PlacesNumber is null" });
            }

            var userId = Convert.ToInt32(User.FindFirstValue("UserId"));
            var user = await _context.Users.FindAsync(userId);

            if (user == null)
            {
                return NotFound(new { Message = "User not found" });
            }

            var seance = await _context.Seances
                .Include(s => s.Seats)
                .FirstOrDefaultAsync(s => s.Id == order.SeanceId);

            if (seance == null)
            {
                return NotFound(new { Message = "Seance not found" });
            }

            if (seance.DateStart < DateTime.UtcNow)
            {
                return BadRequest(
                    new { Message = "The seance has already passed and cannot be ordered." }
                );
            }

            var newOrder = new Order
            {
                OrderedUser = user,
                OrderedSeance = seance,
                Seats = seance.Seats
                    .Where(seat => order.SelectedPlaces.Contains(seat.SeatNumber))
                    .ToList()
            };

            var modifySeats = newOrder.OrderedSeance.Seats
                .Where(seat => order.SelectedPlaces.Any(o => o == seat.SeatNumber))
                .ToList();

            foreach (var seat in modifySeats)
            {
                seat.IsFree = false;
            }

            await _context.Orders.AddAsync(newOrder);
            await _context.SaveChangesAsync();
            await _emailService.SendEmail(newOrder);
            return Ok(new { Message = "Order Added" });
        }

        [HttpDelete("order/{orderId}")]
        public async Task<IActionResult> DeleteOrder(int orderId)
        {
            var order = await _context.Orders
                .Include(o => o.Seats)
                .Include(o => o.OrderedSeance)
                .Include(o => o.OrderedUser)
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null)
            {
                return NotFound(new { Message = "Order not found" });
            }

            DateTimeOffset currentTimeUtc = DateTimeOffset.UtcNow;
            DateTimeOffset seanceDateUtc = order.OrderedSeance.DateStart.ToUniversalTime();
            TimeSpan timeDifference = seanceDateUtc - currentTimeUtc;

            Console.WriteLine($"time difference: {timeDifference} ");

            if (timeDifference > TimeSpan.FromMinutes(30))
            {
                foreach (var seat in order.Seats)
                {
                    seat.IsFree = true;
                }

                await _emailService.SendCancelEmail(order);
                _context.Orders.Remove(order);
                await _context.SaveChangesAsync();

                return Ok(new { Message = "Order Deleted" });
            }
            else
            {
                return BadRequest(
                    new
                    {
                        Message = "Order cannot be deleted within 30 minutes of the seance start time"
                    }
                );
            }
        }

        [HttpGet("orders/{seanceId}")]
        public async Task<ActionResult<Order>> GetOrdersForSeance(int seanceId)
        {
            var ordersForSeance = await _context.Orders
                .Where(o => o.OrderedSeance.Id == seanceId)
                .ToListAsync();

            if (ordersForSeance == null)
            {
                return NotFound();
            }

            return Ok(ordersForSeance);
        }

        [HttpGet("orders")]
        public async Task<ActionResult<Order>> GetAllOrders()
        {
            var currentDate = DateTime.UtcNow;
            var allOrders = await _context.Orders
                .Include(o => o.OrderedSeance)
                .ThenInclude(s => s.Movie)
                .Include(o => o.OrderedUser)
                .Where(o => o.OrderedSeance.DateStart >= currentDate)
                .Include(o => o.Seats)
                .ToListAsync();

            return Ok(allOrders);
        }
    }
}

public record OrderRequest(int SeanceId, int[] SelectedPlaces);
