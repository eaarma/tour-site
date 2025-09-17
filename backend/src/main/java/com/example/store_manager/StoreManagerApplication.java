package com.example.store_manager;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(scanBasePackages = "com.example.store_manager")
@EnableScheduling
public class StoreManagerApplication {

	public static void main(String[] args) {
		SpringApplication.run(StoreManagerApplication.class, args);
	}

}
