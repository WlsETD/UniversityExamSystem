import java.util.*;

class Rectangle703 {
    int width;
    int height;

    Rectangle703(int w, int h) {
        this.width = w;
        this.height = h;
    }

    int area() {
        return width * height;
    }
}

public class J703 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int w = sc.nextInt();
        int h = sc.nextInt();
        Rectangle703 r = new Rectangle703(w, h);
        System.out.print(r.area());
    }
}
