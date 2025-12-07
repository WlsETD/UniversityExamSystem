import java.util.*;

class Circle739 {
    static final double PI = 3.14159;
    int radius;

    Circle739(int radius) {
        this.radius = radius;
    }

    double area() {
        return PI * radius * radius;
    }
}

public class J739 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int r = sc.nextInt();
        Circle739 c = new Circle739(r);
        double a = c.area();
        System.out.printf(java.util.Locale.US, "%.2f", a);
    }
}
