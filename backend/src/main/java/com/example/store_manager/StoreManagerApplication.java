package com.example.store_manager;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = "com.example.store_manager")
public class StoreManagerApplication {

	public static void main(String[] args) {
		SpringApplication.run(StoreManagerApplication.class, args);
	}

}
