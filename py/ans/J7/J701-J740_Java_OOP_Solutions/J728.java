import java.util.*;

class Person728 {
    String name;

    Person728(String name) {
        this.name = name;
    }

    @Override
    public String toString() {
        return "Person:" + name;
    }
}

class Student728 extends Person728 {
    int score;

    Student728(String name, int score) {
        super(name);
        this.score = score;
    }

    @Override
    public String toString() {
        return "Student:" + name + ",score=" + score;
    }
}

public class J728 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String name = sc.next();
        int score = sc.nextInt();
        Student728 s = new Student728(name, score);
        System.out.print(s);
    }
}
