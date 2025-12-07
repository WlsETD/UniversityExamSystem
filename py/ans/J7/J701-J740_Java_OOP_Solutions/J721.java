import java.util.*;

class Person721 {
    String name;

    Person721(String name) {
        this.name = name;
    }

    String info() {
        return "Person:" + name;
    }
}

class Student721 extends Person721 {
    int score;

    Student721(String name, int score) {
        super(name);
        this.score = score;
    }

    @Override
    String info() {
        return "Student:" + name + ",score=" + score;
    }
}

public class J721 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String name = sc.next();
        int score = sc.nextInt();
        Person721 p = new Student721(name, score);
        System.out.print(p.info());
    }
}
