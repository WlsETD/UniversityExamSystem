import java.util.*;

class Temperature710 {
    double celsius;

    Temperature710(double celsius) {
        this.celsius = celsius;
    }

    double toFahrenheit() {
        return celsius * 9 / 5 + 32;
    }
}

public class J710 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        double c = sc.nextDouble();
        Temperature710 t = new Temperature710(c);
        double f = t.toFahrenheit();
        System.out.printf(java.util.Locale.US, "%.1f", f);
    }
}
