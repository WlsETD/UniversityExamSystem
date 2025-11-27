import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();

        if (n < 0) {
            System.out.print("NO");
            return;
        }

        int r = (int) Math.sqrt(n);
        if (r * r == n) {
            System.out.print("YES");
        } else {
            System.out.print("NO");
        }
    }
}
