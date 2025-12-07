import java.util.*;

class Person719 {
    String name;
    int height;

    Person719(String name, int height) {
        this.name = name;
        this.height = height;
    }
}

public class J719 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        Person719 best = null;
        for (int i = 0; i < n; i++) {
            String name = sc.next();
            int h = sc.nextInt();
            Person719 p = new Person719(name, h);
            if (best == null || p.height > best.height) {
                best = p;
            }
        }
        System.out.print(best.name);
    }
}
