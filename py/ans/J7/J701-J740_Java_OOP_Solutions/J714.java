import java.util.*;

class Rectangle714 {
    int width;
    int height;

    Rectangle714(int w, int h) {
        this.width = w;
        this.height = h;
    }

    int area() {
        return width * height;
    }
}

public class J714 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int w1 = sc.nextInt();
        int h1 = sc.nextInt();
        int w2 = sc.nextInt();
        int h2 = sc.nextInt();
        Rectangle714 r1 = new Rectangle714(w1, h1);
        Rectangle714 r2 = new Rectangle714(w2, h2);
        int a1 = r1.area();
        int a2 = r2.area();
        System.out.print(a1 >= a2 ? a1 : a2);
    }
}
