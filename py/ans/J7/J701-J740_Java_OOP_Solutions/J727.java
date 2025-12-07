import java.util.*;

class Shape727 {
    int area() {
        return 0;
    }
}

class Triangle727 extends Shape727 {
    int base;
    int height;

    Triangle727(int base, int height) {
        this.base = base;
        this.height = height;
    }

    @Override
    int area() {
        return base * height / 2;
    }
}

public class J727 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int b = sc.nextInt();
        int h = sc.nextInt();
        Shape727 s = new Triangle727(b, h);
        System.out.print(s.area());
    }
}
