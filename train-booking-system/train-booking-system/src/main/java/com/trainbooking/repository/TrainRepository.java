package com.trainbooking.repository;

import com.trainbooking.model.Train;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TrainRepository extends MongoRepository<Train, String> {

    List<Train> findBySourceIgnoreCaseAndDestinationIgnoreCase(String source, String destination);

    List<Train> findByTrainNumber(String trainNumber);
}
