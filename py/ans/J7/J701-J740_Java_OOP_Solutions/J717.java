import java.util.*;

class Complex717 {
    int real;
    int imag;

    Complex717(int real, int imag) {
        this.real = real;
        this.imag = imag;
    }

    Complex717 add(Complex717 other) {
        return new Complex717(this.real + other.real, this.imag + other.imag);
    }
}

public class J717 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        int c = sc.nextInt();
        int d = sc.nextInt();
        Complex717 x = new Complex717(a, b);
        Complex717 y = new Complex717(c, d);
        Complex717 z = x.add(y);
        System.out.print(z.real + " " + z.imag);
    }
}
