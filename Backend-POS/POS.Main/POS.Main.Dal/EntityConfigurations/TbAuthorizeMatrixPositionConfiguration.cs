using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using POS.Main.Dal.Entities;

namespace POS.Main.Dal.EntityConfigurations;

public class TbAuthorizeMatrixPositionConfiguration : IEntityTypeConfiguration<TbAuthorizeMatrixPosition>
{
    public void Configure(EntityTypeBuilder<TbAuthorizeMatrixPosition> builder)
    {
        builder.ToTable("TbAuthorizeMatrixPositions");

        builder.HasKey(amp => amp.AuthMatrixPositionId);

        builder.Property(amp => amp.AuthMatrixPositionId)
            .ValueGeneratedOnAdd();

        builder.Property(amp => amp.CreatedAt)
            .IsRequired();

        // Relationships
        builder.HasOne(amp => amp.AuthorizeMatrix)
            .WithMany(am => am.AuthorizeMatrixPositions)
            .HasForeignKey(amp => amp.AuthorizeMatrixId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(amp => amp.Position)
            .WithMany(p => p.AuthorizeMatrixPositions)
            .HasForeignKey(amp => amp.PositionId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(amp => new { amp.AuthorizeMatrixId, amp.PositionId })
            .IsUnique()
            .HasDatabaseName("IX_TbAuthMatrixPositions_Matrix_Position");

        builder.HasIndex(amp => amp.PositionId)
            .HasDatabaseName("IX_TbAuthMatrixPositions_PositionId");

        builder.HasIndex(amp => amp.DeleteFlag)
            .HasDatabaseName("IX_TbAuthMatrixPositions_DeleteFlag");
    }
}
