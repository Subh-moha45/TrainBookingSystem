package com.trainbooking.repository;

import com.trainbooking.model.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface BookingRepository extends MongoRepository<Booking, String> {

    Optional<Booking> findByPnr(String pnr);

    List<Booking> findByUserEmailIgnoreCaseOrderByBookingDateDesc(String userEmail);
}
