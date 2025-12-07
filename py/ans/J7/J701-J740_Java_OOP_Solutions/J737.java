import java.util.*;

class Point737 {
    int x, y;

    Point737(int x, int y) {
        this.x = x;
        this.y = y;
    }
}

class Line737 {
    Point737 p1, p2;

    Line737(Point737 p1, Point737 p2) {
        this.p1 = p1;
        this.p2 = p2;
    }

    double length() {
        int dx = p1.x - p2.x;
        int dy = p1.y - p2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}

public class J737 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int x1 = sc.nextInt();
        int y1 = sc.nextInt();
        int x2 = sc.nextInt();
        int y2 = sc.nextInt();
        Point737 p1 = new Point737(x1, y1);
        Point737 p2 = new Point737(x2, y2);
        Line737 line = new Line737(p1, p2);
        double len = line.length();
        System.out.printf(java.util.Locale.US, "%.2f", len);
    }
}
