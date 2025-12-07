import java.util.*;
public class Main{
    public static void main(String[] args){
        Scanner sc = new Scanner(System.in);
        int x = sc.nextInt(), y = sc.nextInt(), z = sc.nextInt();
        int m = x;
        if (y > m) m = y;
        if (z > m) m = z;
        System.out.print(m);
    }
}
