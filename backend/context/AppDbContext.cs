using backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using YourNamespace.Models;

namespace backend.Context
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {

        }
        public DbSet<StaffModel> StaffModel { get; set; }
        public DbSet<ExamTimeTableModel> ExamTimeTable { get; set; }
        public DbSet<StaffTimeTableModel> StaffTimeTable { get; set; }
        public DbSet<ReallocationRequest> ReallocationRequests { get; set; }

    }
}