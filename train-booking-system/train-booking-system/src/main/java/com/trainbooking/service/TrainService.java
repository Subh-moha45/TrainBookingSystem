package com.trainbooking.service;

import com.trainbooking.model.Train;
import com.trainbooking.repository.TrainRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TrainService {

    @Autowired
    private TrainRepository trainRepository;

    public List<Train> getAllTrains() {
        return trainRepository.findAll();
    }

    public Optional<Train> getTrainById(String id) {
        return trainRepository.findById(id);
    }

    public List<Train> searchTrains(String source, String destination) {
        return trainRepository.findBySourceIgnoreCaseAndDestinationIgnoreCase(source.trim(), destination.trim());
    }

    public Train addTrain(Train train) {
        if (train.getAvailableSeats() == 0 && train.getTotalSeats() > 0) {
            train.setAvailableSeats(train.getTotalSeats());
        }
        return trainRepository.save(train);
    }

    public Train updateTrain(String id, Train updated) {
        updated.setId(id);
        return trainRepository.save(updated);
    }

    public void deleteTrain(String id) {
        trainRepository.deleteById(id);
    }
}
