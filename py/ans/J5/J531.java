import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int f1 = 1, f2 = 1;
        for (int i = 1; i <= n; i++) {
            System.out.print(f1);
            if (i < n) System.out.print(",");
            int next = f1 + f2;
            f1 = f2;
            f2 = next;
        }
    }
}
