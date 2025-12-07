import java.util.*;

class Fraction709 {
    int numerator;
    int denominator;

    Fraction709(int numerator, int denominator) {
        this.numerator = numerator;
        this.denominator = denominator;
    }

    double value() {
        return (double) numerator / denominator;
    }
}

public class J709 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int d = sc.nextInt();
        Fraction709 f = new Fraction709(n, d);
        double v = f.value();
        System.out.printf(java.util.Locale.US, "%.2f", v);
    }
}
