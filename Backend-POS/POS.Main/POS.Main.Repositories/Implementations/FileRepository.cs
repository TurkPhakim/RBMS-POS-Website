using POS.Main.Dal;
using POS.Main.Dal.Entities;
using POS.Main.Repositories.Interfaces;

namespace POS.Main.Repositories.Implementations;

public class FileRepository : GenericRepository<TbFile>, IFileRepository
{
    public FileRepository(POSMainContext context) : base(context)
    {
    }
}
