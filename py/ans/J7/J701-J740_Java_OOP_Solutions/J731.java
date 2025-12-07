import java.util.*;

abstract class Shape731 {
    abstract int area();
}

class Rectangle731 extends Shape731 {
    int w, h;

    Rectangle731(int w, int h) {
        this.w = w;
        this.h = h;
    }

    @Override
    int area() {
        return w * h;
    }
}

public class J731 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int w = sc.nextInt();
        int h = sc.nextInt();
        Shape731 s = new Rectangle731(w, h);
        System.out.print(s.area());
    }
}
