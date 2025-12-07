import java.util.*;

class Animal724 {
    String sound() {
        return "???";
    }
}

class Dog724 extends Animal724 {
    @Override
    String sound() {
        return "Woof";
    }
}

class Cat724 extends Animal724 {
    @Override
    String sound() {
        return "Meow";
    }
}

public class J724 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String type = sc.next();
        Animal724 a;
        if ("dog".equals(type)) {
            a = new Dog724();
        } else {
            a = new Cat724();
        }
        System.out.print(a.sound());
    }
}
