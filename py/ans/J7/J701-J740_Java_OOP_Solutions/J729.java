import java.util.*;

class Shape729 {
    int area() {
        return 0;
    }
}

class Rectangle729 extends Shape729 {
    int w, h;

    Rectangle729(int w, int h) {
        this.w = w;
        this.h = h;
    }

    @Override
    int area() {
        return w * h;
    }
}

class Triangle729 extends Shape729 {
    int b, h;

    Triangle729(int b, int h) {
        this.b = b;
        this.h = h;
    }

    @Override
    int area() {
        return b * h / 2;
    }
}

public class J729 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int w = sc.nextInt();
        int h1 = sc.nextInt();
        int b = sc.nextInt();
        int h2 = sc.nextInt();

        Shape729[] arr = new Shape729[2];
        arr[0] = new Rectangle729(w, h1);
        arr[1] = new Triangle729(b, h2);

        int sum = 0;
        for (Shape729 s : arr) {
            sum += s.area();
        }
        System.out.print(sum);
    }
}
