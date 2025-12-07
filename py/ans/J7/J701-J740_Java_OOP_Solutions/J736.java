import java.util.*;

class Address736 {
    String city;

    Address736(String city) {
        this.city = city;
    }
}

class Person736 {
    String name;
    Address736 addr;

    Person736(String name, String city) {
        this.name = name;
        this.addr = new Address736(city);
    }

    String info() {
        return name + "@" + addr.city;
    }
}

public class J736 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String name = sc.next();
        String city = sc.next();
        Person736 p = new Person736(name, city);
        System.out.print(p.info());
    }
}
