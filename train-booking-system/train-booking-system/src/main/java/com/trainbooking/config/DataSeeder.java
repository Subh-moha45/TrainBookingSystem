package com.trainbooking.config;

import com.trainbooking.model.Train;
import com.trainbooking.repository.TrainRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final TrainRepository trainRepository;

    public DataSeeder(TrainRepository trainRepository) {
        this.trainRepository = trainRepository;
    }

    @Override
    public void run(String... args) {
        if (trainRepository.count() > 0) {
            return;
        }

        List<String> allDays = Arrays.asList("MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN");

        Train t1 = new Train("12301", "Rajdhani Express", "Delhi", "Mumbai",
                "16:25", "08:15", "15h 50m", allDays, 120, 120, 1850.0);

        Train t2 = new Train("12951", "Mumbai Rajdhani", "Mumbai", "Delhi",
                "17:00", "08:35", "15h 35m", allDays, 120, 120, 1900.0);

        Train t3 = new Train("12259", "Duronto Express", "Delhi", "Kolkata",
                "10:55", "12:30", "25h 35m", Arrays.asList("MON", "WED", "FRI", "SUN"), 100, 100, 2100.0);

        Train t4 = new Train("12622", "Tamil Nadu Express", "Delhi", "Chennai",
                "22:30", "07:15", "32h 45m", allDays, 90, 90, 2400.0);

        Train t5 = new Train("12002", "Shatabdi Express", "Delhi", "Bhopal",
                "06:00", "14:10", "8h 10m", Arrays.asList("MON", "TUE", "WED", "THU", "FRI", "SAT"), 80, 80, 1200.0);

        Train t6 = new Train("12009", "Shatabdi Express", "Mumbai", "Ahmedabad",
                "06:25", "13:00", "6h 35m", allDays, 80, 80, 950.0);

        Train t7 = new Train("12841", "Coromandel Express", "Kolkata", "Chennai",
                "14:50", "18:00", "27h 10m", allDays, 100, 100, 1750.0);

        Train t8 = new Train("12626", "Kerala Express", "Delhi", "Thiruvananthapuram",
                "11:25", "06:30", "43h 05m", allDays, 110, 110, 2650.0);

        Train t9 = new Train("12652", "Sampark Kranti", "Bengaluru", "Delhi",
                "06:20", "05:15", "22h 55m", Arrays.asList("MON", "THU", "SAT"), 95, 95, 2200.0);

        Train t10 = new Train("12723", "Telangana Express", "Hyderabad", "Delhi",
                "18:00", "20:15", "26h 15m", allDays, 100, 100, 2050.0);

        trainRepository.saveAll(Arrays.asList(t1, t2, t3, t4, t5, t6, t7, t8, t9, t10));
        System.out.println("Seeded " + trainRepository.count() + " sample trains into MongoDB.");
    }
}
