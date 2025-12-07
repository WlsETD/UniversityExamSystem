import java.util.*;

class Person716 {
    String name;
    int age;

    Person716(String name, int age) {
        this.name = name;
        this.age = age;
    }

    @Override
    public String toString() {
        return name + "(" + age + ")";
    }
}

public class J716 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String name = sc.next();
        int age = sc.nextInt();
        Person716 p = new Person716(name, age);
        System.out.print(p);
    }
}
