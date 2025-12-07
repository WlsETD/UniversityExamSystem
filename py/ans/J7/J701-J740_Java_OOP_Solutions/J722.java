import java.util.*;

class Vehicle722 {
    int speed;

    Vehicle722(int speed) {
        this.speed = speed;
    }
}

class Car722 extends Vehicle722 {
    String brand;

    Car722(String brand, int speed) {
        super(speed);
        this.brand = brand;
    }
}

public class J722 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String brand = sc.next();
        int speed = sc.nextInt();
        Car722 car = new Car722(brand, speed);
        System.out.print(car.brand + " " + car.speed);
    }
}
