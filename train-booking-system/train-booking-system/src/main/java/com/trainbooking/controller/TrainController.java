package com.trainbooking.controller;

import com.trainbooking.model.Train;
import com.trainbooking.service.TrainService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/trains")
public class TrainController {

    @Autowired
    private TrainService trainService;

    @GetMapping
    public List<Train> getAllTrains() {
        return trainService.getAllTrains();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTrainById(@PathVariable String id) {
        return trainService.getTrainById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Train not found")));
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchTrains(@RequestParam String source, @RequestParam String destination) {
        List<Train> trains = trainService.searchTrains(source, destination);
        return ResponseEntity.ok(trains);
    }

    @PostMapping
    public ResponseEntity<Train> addTrain(@RequestBody Train train) {
        return ResponseEntity.status(HttpStatus.CREATED).body(trainService.addTrain(train));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Train> updateTrain(@PathVariable String id, @RequestBody Train train) {
        return ResponseEntity.ok(trainService.updateTrain(id, train));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTrain(@PathVariable String id) {
        trainService.deleteTrain(id);
        return ResponseEntity.ok(Map.of("message", "Train deleted"));
    }
}
