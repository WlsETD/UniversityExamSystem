import java.util.*;

class Person707 {
    String name;
    int age;

    Person707(String name, int age) {
        this.name = name;
        this.age = age;
    }

    Person707(String name) {
        this(name, 0);
    }

    String info() {
        return name + "(" + age + ")";
    }
}

public class J707 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String name = sc.next();
        int age = sc.nextInt();
        Person707 p = new Person707(name, age);
        System.out.print(p.info());
    }
}
