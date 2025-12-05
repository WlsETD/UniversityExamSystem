import java.util.*;

public class Main {
    static boolean isPrime(int n) {
        if (n < 2) return false;
        for (int i = 2; i * i <= n; i++) {
            if (n % i == 0) return false;
        }
        return true;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        boolean first = true;
        for (int i = 2; i <= n; i++) {
            if (isPrime(i)) {
                if (!first) System.out.print(" ");
                System.out.print(i);
                first = false;
            }
        }
    }
}
