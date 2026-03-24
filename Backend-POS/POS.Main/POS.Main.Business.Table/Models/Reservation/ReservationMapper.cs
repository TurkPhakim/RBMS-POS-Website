using POS.Main.Core.Enums;
using POS.Main.Dal.Entities;

namespace POS.Main.Business.Table.Models.Reservation;

public static class ReservationMapper
{
    public static ReservationResponseModel ToResponse(TbReservation entity)
    {
        return new ReservationResponseModel
        {
            ReservationId = entity.ReservationId,
            CustomerName = entity.CustomerName,
            CustomerPhone = entity.CustomerPhone,
            ReservationDate = entity.ReservationDate,
            ReservationTime = entity.ReservationTime,
            GuestCount = entity.GuestCount,
            TableId = entity.TableId,
            TableName = entity.Table?.TableName,
            Note = entity.Note,
            Status = entity.Status.ToString(),
            ReminderSent = entity.ReminderSent,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt,
            CreatedBy = entity.CreatedByEmployee?.Nickname ?? entity.CreatedBy?.ToString(),
            UpdatedBy = entity.UpdatedByEmployee?.Nickname ?? entity.UpdatedBy?.ToString()
        };
    }

    public static TbReservation ToEntity(CreateReservationRequestModel request)
    {
        return new TbReservation
        {
            CustomerName = request.CustomerName,
            CustomerPhone = request.CustomerPhone,
            ReservationDate = request.ReservationDate,
            ReservationTime = request.ReservationTime,
            GuestCount = request.GuestCount,
            TableId = request.TableId,
            Note = request.Note,
            Status = EReservationStatus.Pending
        };
    }

    public static void UpdateEntity(TbReservation entity, UpdateReservationRequestModel request)
    {
        entity.CustomerName = request.CustomerName;
        entity.CustomerPhone = request.CustomerPhone;
        entity.ReservationDate = request.ReservationDate;
        entity.ReservationTime = request.ReservationTime;
        entity.GuestCount = request.GuestCount;
        entity.TableId = request.TableId;
        entity.Note = request.Note;
    }
}
