import java.util.*;

class Student702 {
    String name;
    int score;

    Student702(String name, int score) {
        this.name = name;
        this.score = score;
    }

    String info() {
        return name + " " + score;
    }
}

public class J702 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String name = sc.next();
        int score = sc.nextInt();
        Student702 s = new Student702(name, score);
        System.out.print(s.info());
    }
}
