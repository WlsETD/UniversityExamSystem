import java.util.*;

public class J523 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();

        for (int i = 1; i <= n; i++) {

            // 印空白：前面 n-i 個
            for (int s = 1; s <= n - i; s++) {
                System.out.print(" ");
            }

            // 印星星：2*i-1 個
            for (int k = 1; k <= 2 * i - 1; k++) {
                System.out.print("*");
            }

            if (i < n)
                System.out.println();
        }
    }
}
