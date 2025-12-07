import java.util.*;

interface Calculator734 {
    int calc(int a, int b);
}

class AddCalculator734 implements Calculator734 {
    public int calc(int a, int b) {
        return a + b;
    }
}

public class J734 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        Calculator734 c = new AddCalculator734();
        System.out.print(c.calc(a, b));
    }
}
