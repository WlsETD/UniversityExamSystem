import java.util.*;

interface Calculator735 {
    int calc(int a, int b);
}

class AddCalculator735 implements Calculator735 {
    public int calc(int a, int b) {
        return a + b;
    }
}

class MulCalculator735 implements Calculator735 {
    public int calc(int a, int b) {
        return a * b;
    }
}

public class J735 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String op = sc.next();
        int a = sc.nextInt();
        int b = sc.nextInt();
        Calculator735 c;
        if ("add".equals(op)) {
            c = new AddCalculator735();
        } else {
            c = new MulCalculator735();
        }
        System.out.print(c.calc(a, b));
    }
}
