import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        boolean first = true;
        for (int i = 1; i <= n; i++) {
            if (i % 2 == 0 || i % 5 == 0) continue;
            if (!first) System.out.print(" ");
            System.out.print(i);
            first = false;
        }
    }
}
