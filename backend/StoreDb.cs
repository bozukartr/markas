using Microsoft.EntityFrameworkCore;
namespace Markas;

public class StoreDb(DbContextOptions<StoreDb> options) : DbContext(options)
{
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Sale> Sales => Set<Sale>();
    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<Product>().HasIndex(p => p.Barcode).IsUnique();
        b.Entity<Sale>().HasKey(s => new { s.StoreId, s.Id });
    }
}
