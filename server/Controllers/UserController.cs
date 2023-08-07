using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
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
    public class UserController : Controller
    {
        private readonly AppDbContext _authContext;
        private readonly IConfiguration _configuration;

        public UserController(AppDbContext appDbContext, IConfiguration configuration)
        {
            _authContext = appDbContext;
            _configuration = configuration;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] User userObj)
        {
            if (userObj == null)
                return BadRequest();

            var user = await _authContext.Users.FirstOrDefaultAsync(x => x.Email == userObj.Email);
            if (user == null)
            {
                return NotFound(new { Message = "User Not Found" });
            }

            if (user.Password != userObj.Password)
                return BadRequest(new { Message = "Password is incorrect" });

            user.Token = CreateJwt(user);

            return Ok(new { Token = user.Token, Message = "Login Success" });
        }

        [HttpPost("signup")]
        public async Task<IActionResult> SignUp([FromBody] User userObj)
        {
            if (userObj == null)
                return BadRequest();

            if (await CheckEmailExistAsync(userObj.Email))
                return BadRequest(new { Message = "Email already exist!" });

            var pass = CheckPasswordStrength(userObj.Password);
            if (!string.IsNullOrEmpty(pass))
                return BadRequest(new { Message = pass.ToString() });

            userObj.Role = "User";
            userObj.Token = "";

            await _authContext.Users.AddAsync(userObj);
            await _authContext.SaveChangesAsync();

            return Ok(new { Message = "User Registered" });
        }

        [HttpGet("allUsers")]
        public async Task<ActionResult<User>> GetAllUsers()
        {
            return Ok(await _authContext.Users.ToListAsync());
        }

        [HttpGet("user/{id}")]
        public async Task<IActionResult> GetUserById(int id)
        {
            var user = await _authContext.Users.FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
            {
                return NotFound(new { Message = "User not found" });
            }

            return Ok(user);
        }

        [HttpPut("updateUser/{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] User updatedUser)
        {
            var userId = Convert.ToInt32(User.FindFirstValue("UserId"));
            if (userId != id)
            {
                return Forbid();
            }

            var user = await _authContext.Users.FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
            {
                return NotFound(new { Message = "User not found" });
            }

            if (
                user.FirstName == updatedUser.FirstName
                && user.LastName == updatedUser.LastName
                && user.Password == updatedUser.Password
            )
            {
                return Ok(new { Message = "Data unchanged" });
            }

            user.FirstName = updatedUser.FirstName;
            user.LastName = updatedUser.LastName;

            var pass = CheckPasswordStrength(updatedUser.Password);
            if (!string.IsNullOrEmpty(pass))
            {
                return BadRequest(new { Message = pass.ToString() });
            }

            user.Password = updatedUser.Password;

            user.Password = updatedUser.Password;

            _authContext.Update(user);
            await _authContext.SaveChangesAsync();

            return Ok(new { Message = "User data updated successfully" });
        }

        private Task<bool> CheckEmailExistAsync(string email) =>
            _authContext.Users.AnyAsync(x => x.Email == email);

        private string CheckPasswordStrength(string password)
        {
            StringBuilder sb = new StringBuilder();
            if (password.Length < 8)
                sb.Append("Minimum password length should be 8" + Environment.NewLine);

            if (
                !(
                    Regex.IsMatch(password, "[a-z]")
                    && Regex.IsMatch(password, "[A-Z]")
                    && Regex.IsMatch(password, "[0-9]")
                )
            )
                sb.Append("Password should be Alphanumeric" + Environment.NewLine);

            if (!Regex.IsMatch(password, "[!@#%^&*()_+\\-=[\\]{}|;':\",./<>?~`]"))
                sb.Append("Password should contain special chars" + Environment.NewLine);

            return sb.ToString();
        }

        private string CreateJwt(User user)
        {
            var jwtSecretKey = _configuration["JwtConfig:SecretKey"];
            if (string.IsNullOrEmpty(jwtSecretKey))
            {
                throw new ApplicationException("JWT secret key is not configured.");
            }

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(jwtSecretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.Role, user.Role),
                new Claim(ClaimTypes.Name, $"{user.FirstName} {user.LastName}"),
                new Claim("UserId", user.Id.ToString())
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddDays(1),
                SigningCredentials = credentials
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}
