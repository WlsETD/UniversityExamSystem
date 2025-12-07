import java.util.*;

class Shape725 {
    int area() {
        return 0;
    }
}

class Rectangle725 extends Shape725 {
    int w, h;

    Rectangle725(int w, int h) {
        this.w = w;
        this.h = h;
    }

    @Override
    int area() {
        return w * h;
    }
}

class Square725 extends Rectangle725 {
    Square725(int s) {
        super(s, s);
    }
}

public class J725 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int s = sc.nextInt();
        Shape725 shape = new Square725(s);
        System.out.print(shape.area());
    }
}
