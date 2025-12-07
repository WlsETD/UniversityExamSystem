import java.util.*;

class Person726 {
    String name;

    Person726(String name) {
        this.name = name;
    }

    String role() {
        return "Person";
    }

    String info() {
        return role() + ":" + name;
    }
}

class Student726 extends Person726 {
    Student726(String name) {
        super(name);
    }

    @Override
    String role() {
        return "Student";
    }
}

class Teacher726 extends Person726 {
    Teacher726(String name) {
        super(name);
    }

    @Override
    String role() {
        return "Teacher";
    }
}

public class J726 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String type = sc.next();
        String name = sc.next();
        Person726 p;
        if ("S".equals(type)) {
            p = new Student726(name);
        } else {
            p = new Teacher726(name);
        }
        System.out.print(p.info());
    }
}
