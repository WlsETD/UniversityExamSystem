import java.util.*;

class Student711 {
    String name;
    int score;

    Student711(String name, int score) {
        this.name = name;
        this.score = score;
    }
}

public class J711 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        Student711[] arr = new Student711[n];
        int sum = 0;
        for (int i = 0; i < n; i++) {
            String name = sc.next();
            int score = sc.nextInt();
            arr[i] = new Student711(name, score);
            sum += score;
        }
        System.out.print(sum / n);
    }
}
