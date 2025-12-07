import java.util.*;

class Animal730 {
    String sound() {
        return "???";
    }
}

class Dog730 extends Animal730 {
    @Override
    String sound() {
        return "Woof";
    }
}

class Cat730 extends Animal730 {
    @Override
    String sound() {
        return "Meow";
    }
}

class Util730 {
    static void printSound(Animal730 a) {
        System.out.print(a.sound());
    }
}

public class J730 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String type = sc.next();
        Animal730 a;
        if ("dog".equals(type)) {
            a = new Dog730();
        } else {
            a = new Cat730();
        }
        Util730.printSound(a);
    }
}
