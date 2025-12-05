import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int[] x = new int[5];
        for (int i = 0; i < 5; i++) {
            x[i] = sc.nextInt();
        }
        int m = x[0];
        for (int v : x) {
            if (v > m) m = v;
        }
        System.out.print(m);
    }
}
