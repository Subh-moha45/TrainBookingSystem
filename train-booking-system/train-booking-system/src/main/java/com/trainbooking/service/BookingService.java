package com.trainbooking.service;

import com.trainbooking.model.Booking;
import com.trainbooking.model.Train;
import com.trainbooking.repository.BookingRepository;
import com.trainbooking.repository.TrainRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private TrainRepository trainRepository;

    private static final String ALPHANUM = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    /**
     * Creates a booking. Synchronized to reduce the chance of overselling seats
     * under concurrent requests for this demo application.
     */
    public synchronized Booking createBooking(Booking booking) {
        Train train = trainRepository.findById(booking.getTrainId())
                .orElseThrow(() -> new IllegalArgumentException("Train not found: " + booking.getTrainId()));

        int requestedSeats = booking.getPassengers() != null ? booking.getPassengers().size() : booking.getSeatsBooked();

        if (train.getAvailableSeats() < requestedSeats) {
            throw new IllegalStateException("Not enough seats available. Only " + train.getAvailableSeats() + " left.");
        }

        // Assign simple seat numbers
        int startSeat = train.getTotalSeats() - train.getAvailableSeats() + 1;
        for (int i = 0; i < booking.getPassengers().size(); i++) {
            booking.getPassengers().get(i).setSeatNumber("S" + (startSeat + i));
        }

        train.setAvailableSeats(train.getAvailableSeats() - requestedSeats);
        trainRepository.save(train);

        booking.setSeatsBooked(requestedSeats);
        booking.setTrainNumber(train.getTrainNumber());
        booking.setTrainName(train.getTrainName());
        booking.setSource(train.getSource());
        booking.setDestination(train.getDestination());
        booking.setTotalFare(train.getFare() * requestedSeats);
        booking.setStatus("CONFIRMED");
        booking.setBookingDate(LocalDateTime.now());
        booking.setPnr(generatePnr());

        return bookingRepository.save(booking);
    }

    public Optional<Booking> getBookingByPnr(String pnr) {
        return bookingRepository.findByPnr(pnr.trim().toUpperCase());
    }

    public List<Booking> getBookingsByEmail(String email) {
        return bookingRepository.findByUserEmailIgnoreCaseOrderByBookingDateDesc(email);
    }

    public synchronized Booking cancelBooking(String pnr) {
        Booking booking = bookingRepository.findByPnr(pnr.trim().toUpperCase())
                .orElseThrow(() -> new IllegalArgumentException("Booking not found for PNR: " + pnr));

        if ("CANCELLED".equals(booking.getStatus())) {
            throw new IllegalStateException("Booking already cancelled.");
        }

        booking.setStatus("CANCELLED");

        trainRepository.findById(booking.getTrainId()).ifPresent(train -> {
            train.setAvailableSeats(Math.min(train.getTotalSeats(),
                    train.getAvailableSeats() + booking.getSeatsBooked()));
            trainRepository.save(train);
        });

        return bookingRepository.save(booking);
    }

    private String generatePnr() {
        StringBuilder sb = new StringBuilder("PNR");
        for (int i = 0; i < 7; i++) {
            sb.append(ALPHANUM.charAt(RANDOM.nextInt(ALPHANUM.length())));
        }
        String pnr = sb.toString();
        // ensure uniqueness
        if (bookingRepository.findByPnr(pnr).isPresent()) {
            return generatePnr();
        }
        return pnr;
    }
}
