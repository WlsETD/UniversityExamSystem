import java.util.*;

class Circle706 {
    int radius;

    Circle706(int radius) {
        this.radius = radius;
    }

    double length() {
        return 2 * Math.PI * radius;
    }
}

public class J706 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int r = sc.nextInt();
        Circle706 c = new Circle706(r);
        double len = c.length();
        System.out.printf(java.util.Locale.US, "%.2f", len);
    }
}
